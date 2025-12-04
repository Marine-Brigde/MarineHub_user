// Lightweight Overpass-based river routing PoC (client-side)
// - Queries waterways in a small bbox
// - Builds a graph from OSM ways/nodes
// - Runs Dijkstra to get a path between nearest nodes to start/end

type Pt = [number, number]; // [lng, lat]

function haversine(a: Pt, b: Pt) {
    const toRad = (v: number) => v * Math.PI / 180;
    const R = 6371000; // meters
    const dLat = toRad(b[1] - a[1]);
    const dLon = toRad(b[0] - a[0]);
    const lat1 = toRad(a[1]);
    const lat2 = toRad(b[1]);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const aa = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
}

const cache = new Map<string, Pt[] | null>();

export async function findRiverRoute(start: Pt, end: Pt, opts?: { maxBBoxDegrees?: number, pad?: number }): Promise<Pt[] | null> {
    const maxBBoxDegrees = opts?.maxBBoxDegrees ?? 0.25; // avoid huge queries
    const pad = opts?.pad ?? 0.02;

    const minLat = Math.min(start[1], end[1]) - pad;
    const maxLat = Math.max(start[1], end[1]) + pad;
    const minLon = Math.min(start[0], end[0]) - pad;
    const maxLon = Math.max(start[0], end[0]) + pad;

    if ((maxLat - minLat) > maxBBoxDegrees || (maxLon - minLon) > maxBBoxDegrees) return null;

    const bboxKey = [minLat, minLon, maxLat, maxLon].map(v => v.toFixed(6)).join(',');
    if (cache.has(bboxKey)) return cache.get(bboxKey) ?? null;

    const overpass = 'https://overpass-api.de/api/interpreter';
    const q = `
    [out:json][timeout:25];
    (
      way["waterway"~"river|stream|canal|riverbank|drain"](${minLat},${minLon},${maxLat},${maxLon});
    );
    out body;
    >;
    out skel qt;
    `;

    let resJson: any = null;
    try {
        const r = await fetch(overpass, { method: 'POST', body: q });
        if (!r.ok) throw new Error('Overpass error ' + r.status);
        resJson = await r.json();
    } catch (e) {
        cache.set(bboxKey, null);
        return null;
    }

    // collect nodes and ways
    const nodes = new Map<number, Pt>();
    const ways: Array<{ id: number, nodes: number[] }> = [];
    for (const el of resJson.elements || []) {
        if (el.type === 'node') {
            nodes.set(el.id, [el.lon, el.lat]);
        } else if (el.type === 'way') {
            if (Array.isArray(el.nodes) && el.nodes.length > 0) ways.push({ id: el.id, nodes: el.nodes });
        }
    }

    if (ways.length === 0 || nodes.size === 0) {
        cache.set(bboxKey, null);
        return null;
    }

    // build adjacency
    const adj = new Map<number, Array<{ to: number, w: number }>>();
    const ensure = (id: number) => { if (!adj.has(id)) adj.set(id, []); };
    for (const w of ways) {
        for (let i = 0; i < w.nodes.length - 1; i++) {
            const a = w.nodes[i];
            const b = w.nodes[i + 1];
            const pa = nodes.get(a);
            const pb = nodes.get(b);
            if (!pa || !pb) continue;
            const d = haversine(pa, pb);
            ensure(a); ensure(b);
            adj.get(a)!.push({ to: b, w: d });
            adj.get(b)!.push({ to: a, w: d });
        }
    }

    if (adj.size === 0) { cache.set(bboxKey, null); return null; }

    // find nearest node ids to start/end
    let startNode: number | null = null;
    let endNode: number | null = null;
    let minS = Infinity; let minE = Infinity;
    for (const [id, pt] of nodes.entries()) {
        const ds = haversine(start, pt);
        if (ds < minS) { minS = ds; startNode = id; }
        const de = haversine(end, pt);
        if (de < minE) { minE = de; endNode = id; }
    }

    if (startNode == null || endNode == null) { cache.set(bboxKey, null); return null; }

    // Dijkstra
    const dist = new Map<number, number>();
    const prev = new Map<number, number | null>();
    const Q = new Set<number>();
    for (const k of adj.keys()) { dist.set(k, Infinity); prev.set(k, null); Q.add(k); }
    dist.set(startNode, 0);

    while (Q.size) {
        let u: number | null = null; let best = Infinity;
        for (const v of Q) { const dv = dist.get(v) ?? Infinity; if (dv < best) { best = dv; u = v; } }
        if (u == null) break;
        Q.delete(u);
        if (u === endNode) break;
        const neighbors = adj.get(u) || [];
        for (const nb of neighbors) {
            if (!Q.has(nb.to)) continue;
            const alt = (dist.get(u) ?? Infinity) + nb.w;
            if (alt < (dist.get(nb.to) ?? Infinity)) {
                dist.set(nb.to, alt);
                prev.set(nb.to, u);
            }
        }
    }

    // reconstruct path
    const pathIds: number[] = [];
    let cur: number | null = endNode;
    while (cur != null) { pathIds.push(cur); cur = prev.get(cur) ?? null; }
    pathIds.reverse();

    if (pathIds.length === 0) { cache.set(bboxKey, null); return null; }

    const path: Pt[] = [];
    for (const id of pathIds) {
        const p = nodes.get(id);
        if (p) path.push(p);
    }

    cache.set(bboxKey, path);
    return path;
}

export function clearOsmRouteCache() { cache.clear(); }
