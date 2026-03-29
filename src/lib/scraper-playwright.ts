import { randomUUID } from 'node:crypto';
import { saveJob, connectDB } from './db';

const NODEJS_REGEX = /node\.?js|nodejs/i;

function containsNodeJS(text: string): boolean {
  return NODEJS_REGEX.test(text);
}

function naventHeaders(siteId: string, origin: string): Record<string, string> {
  return {
    'content-type': 'application/json',
    'accept': 'application/json',
    'x-pre-session-token': randomUUID(),
    'x-site-id': siteId,
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'referer': origin,
    'origin': origin,
  };
}

// ─────────────────────────────────────────────
//  NAVENT API helper genérico
// ─────────────────────────────────────────────
async function scrapeNavent(
  siteId: string,
  origin: string,
  sourceName: string,
  urlTemplate: (slug: string, id: number) => string,
  portalFilter: string,    // solo incluir ofertas donde job.portal === portalFilter
): Promise<any[]> {
  const jobs: any[] = [];
  console.log(`\n📌 ${sourceName} (Navent API)...`);
  const seen = new Set<string>();

  for (const keyword of ['node', 'node.js', 'node js']) {
    try {
      const r = await fetch(
        `${origin}/api/avisos/searchV2?pageSize=50&page=0&sort=RELEVANTES`,
        {
          method: 'POST',
          headers: naventHeaders(siteId, origin),
          body: JSON.stringify({ filtros: [], query: keyword }),
        }
      );
      if (!r.ok) { console.log(`  ⚠️ ${r.status} "${keyword}"`); continue; }
      const data = await r.json() as { content?: any[] };
      const items = data.content ?? [];
      console.log(`  "${keyword}" → ${items.length} resultados`);

      for (const job of items) {
        // Filtrar solo los del portal propio para evitar duplicados cruzados
        if (job.portal && job.portal !== portalFilter) continue;

        const title: string = job.titulo ?? '';
        const desc: string = job.detalle ?? '';
        if (!containsNodeJS(title + ' ' + desc)) continue;

        const slug = title
          .toLowerCase()
          .normalize('NFD')
          .replaceAll(/[\u0300-\u036f]/g, '')
          .replaceAll(/[^a-z0-9\s]/g, '')
          .trim()
          .replaceAll(/\s+/g, '-');
        const url = urlTemplate(slug, job.id);
        if (seen.has(url)) continue;
        seen.add(url);

        const record = {
          title, url, source: sourceName,
          company: job.empresa ?? 'Confidencial',
          location: job.localizacion ?? '',
          description: desc.substring(0, 800),
          jobType: job.tipoTrabajo ?? '',
          modality: job.modalidadTrabajo ?? '',
          salary: '',
        };
        await saveJob(record);
        jobs.push(record);
        console.log(`  ✅ ${title.substring(0, 60)}`);
      }
    } catch (e: any) {
      console.log(`  ❌ "${keyword}": ${e?.message?.substring(0, 60)}`);
    }
  }

  console.log(`  📊 ${sourceName}: ${jobs.length} ofertas\n`);
  return jobs;
}

async function scrapeBumeran(): Promise<any[]> {
  return scrapeNavent(
    'BMAR',
    'https://www.bumeran.com.ar',
    'Bumeran',
    (slug, id) => `https://www.bumeran.com.ar/empleos/${slug}-${id}.html`,
    'bumeran',
  );
}

async function scrapeZonaJobs(): Promise<any[]> {
  return scrapeNavent(
    'ZJAR',
    'https://www.zonajobs.com.ar',
    'ZonaJobs',
    (slug, id) => `https://www.zonajobs.com.ar/empleos/${slug}-${id}.html`,
    'zonajobs',
  );
}

// ─────────────────────────────────────────────
//  COMPUTRABAJO — HTML listing + API de detalle
// ─────────────────────────────────────────────
async function scrapeComputrabajo(): Promise<any[]> {
  const jobs: any[] = [];
  console.log('\n📌 Computrabajo...');

  const fetchHeaders = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'es-AR,es;q=0.9',
  };

  const searchUrls = [
    'https://ar.computrabajo.com/trabajo-de-nodejs',
    'https://ar.computrabajo.com/trabajo-de-node-js',
  ];

  // IDs únicos de ofertas (hash de 32 chars al final de la URL)
  const offerIds = new Set<string>();

  for (const searchUrl of searchUrls) {
    try {
      console.log(`  🔗 ${searchUrl}`);
      const r = await fetch(searchUrl, { headers: fetchHeaders });
      if (!r.ok) { console.log(`  ⚠️ ${r.status}`); continue; }
      const html = await r.text();

      // Links tienen formato: /ofertas-de-trabajo/oferta-de-trabajo-de-...-{32charHEX}
      const idRegex = /oferta-de-trabajo-de-[^"#]+?-([A-F0-9]{32})/gi;
      let m: RegExpExecArray | null;
      while ((m = idRegex.exec(html)) !== null) {
        offerIds.add(m[1]);
      }
      console.log(`  📋 ${offerIds.size} ofertas únicas acumuladas`);
    } catch (e: any) {
      console.log(`  ❌ ${e?.message?.substring(0, 60)}`);
    }
  }

  // Usar la API JSON de detalle directamente
  for (const offerId of Array.from(offerIds).slice(0, 30)) {
    const jobData = await fetchComputrabajoOffer(offerId, fetchHeaders);
    if (jobData && containsNodeJS(jobData.title + ' ' + jobData.description)) {
      const record = { ...jobData, source: 'Computrabajo' };
      await saveJob(record);
      jobs.push(record);
      console.log(`  ✅ ${jobData.title.substring(0, 60)}`);
    }
  }

  console.log(`  📊 Computrabajo: ${jobs.length} ofertas\n`);
  return jobs;
}

async function fetchComputrabajoOffer(offerId: string, headers: Record<string, string>): Promise<any | null> {
  try {
    const r = await fetch(
      `https://oferta.computrabajo.com/offer/${offerId}/d/j?ipo=5&iapo=1`,
      { headers: { ...headers, accept: 'application/json' } }
    );
    if (!r.ok) return null;
    const data = await r.json() as any;
    const o = data?.o;
    if (!o) return null;

    // Campos reales del API de Computrabajo:
    // t = título, ltr = título largo, cn = empresa, lc = ubicación
    // lset = tipo de jornada, lss = salario, ld = descripción, ur = URL relativa
    // lsm / wm / modality = modalidad de trabajo (remoto/híbrido/presencial)
    const title: string = o.ltr ?? o.t ?? '';
    if (!title || title.length < 3) return null;

    // Intentar extraer modalidad de varios campos posibles
    const rawModality: string = o.lsm ?? o.wm ?? o.modality ?? o.lmod ?? '';
    // Normalizar al mismo formato que Navent usa (Remoto / Híbrido / Presencial)
    let modality = '';
    if (/remot/i.test(rawModality)) modality = 'Remoto';
    else if (/h[ií]brid/i.test(rawModality)) modality = 'Híbrido';
    else if (/presencial|on.?site|oficina/i.test(rawModality)) modality = 'Presencial';
    // Fallback: buscar en la descripción si la URL contiene "remoto"
    else if (/remot/i.test(o.ur ?? '')) modality = 'Remoto';

    console.log(`    modality raw="${rawModality}" → "${modality}" (campos disponibles: ${Object.keys(o).join(', ')})`);

    return {
      title,
      company: o.cn ?? 'No especificada',
      location: o.lc ?? o.c ?? '',
      jobType: o.lset ?? '',
      salary: o.lss ?? '',
      modality,
      url: o.ur ? `https://ar.computrabajo.com${o.ur}` : `https://ar.computrabajo.com/oferta-${offerId}`,
      description: (o.ld ?? '').substring(0, 800),
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
//  ENTRY POINT
// ─────────────────────────────────────────────
export async function scrapeAllJobs(): Promise<any[]> {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   🚀 SCRAPING Node.js Jobs               ║');
  console.log('╚══════════════════════════════════════════╝');

  await connectDB();
  const allJobs: any[] = [];

  for (const [name, fn] of [
    ['Bumeran', scrapeBumeran],
    ['ZonaJobs', scrapeZonaJobs],
    ['Computrabajo', scrapeComputrabajo],
  ] as [string, () => Promise<any[]>][]) {
    try {
      allJobs.push(...await fn());
    } catch (e: any) {
      console.error(`❌ ${name}:`, e?.message);
    }
  }

  console.log(`\n✅ Total: ${allJobs.length} Node.js jobs\n`);
  return allJobs;
}

export function closeBrowser(): void {}
