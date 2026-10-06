#!/usr/bin/env python3
"""
update-address-data.py — rebuilds data/ph-address/ from the official PSA PSGC list.

Source format: the "ph-psgc" JSON release (github.com/Tenasia/ph-psgc), which mirrors
PSA's quarterly PSGC datafile (https://psa.gov.ph/classification/psgc).

Use (each quarter, after PSA's new release):
  1. Download ph-psgc-<version>.zip from the repo's Releases page and unzip it.
  2. python tools/update-address-data.py  path/to/ph-psgc-<version>/psgc
  3. Copy the new data/ph-address folder to the server. Nothing else changes.
"""
import json, os, re, sys, glob, shutil, collections

SRC = sys.argv[1] if len(sys.argv) > 1 else 'psgc'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'ph-address')

# independent cities → the province they are geographically inside (what buyers expect)
INDEPENDENT_TO_PROVINCE = {
    'Angeles': 'Pampanga', 'Bacolod': 'Negros Occidental', 'Baguio': 'Benguet', 'Butuan': 'Agusan del Norte',
    'Cagayan De Oro': 'Misamis Oriental', 'Cebu': 'Cebu', 'Davao': 'Davao del Sur', 'General Santos': 'South Cotabato',
    'Iligan': 'Lanao del Norte', 'Iloilo': 'Iloilo', 'Lapu-Lapu': 'Cebu', 'Lucena': 'Quezon', 'Mandaue': 'Cebu',
    'Olongapo': 'Zambales', 'Puerto Princesa': 'Palawan', 'Tacloban': 'Leyte', 'Zamboanga': 'Zamboanga del Sur',
    'Isabela': 'Basilan',
}
# J&T shipping areas (keys of LF_SHIP_ZONES in backend/Shipping.php)
ISLAND = {'batanes', 'marinduque', 'occidental mindoro', 'oriental mindoro', 'palawan', 'romblon', 'masbate', 'catanduanes'}
NORTH = {'01', '02', '03', '14'}; VISAYAS = {'06', '07', '08', '18'}; MINDANAO = {'09', '10', '11', '12', '16', '19'}
BATANGAS_TOWNS = {'Sto. Tomas': 'santo_tomas', 'Lipa': 'lipa', 'Batangas': 'batangas_city', 'Tanauan': 'tanauan',
                  'Rosario': 'rosario', 'Bauan': 'bauan', 'San Jose': 'san_jose', 'Nasugbu': 'nasugbu'}

def clean(s): return re.sub(r'\s+', ' ', str(s)).strip()
def titled(n): return re.sub(r'\b(Del|De|Of|And)\b', lambda m: m.group(1).lower(), clean(n))
def city_name(n):
    n = clean(n); m = re.match(r'^City of (.+)$', n, re.I)
    return (m.group(1).strip() + ' City') if m else n
def bare(n): return re.sub(r'^City of ', '', clean(n), flags=re.I)

def province_zone(name, reg):
    n = name.lower()
    if reg == '13': return 'metro_manila'
    if n in ISLAND: return 'island'
    if n == 'batangas': return 'other_batangas'
    if n == 'quezon': return 'quezon_province'
    if n in ('laguna', 'cavite', 'rizal'): return n
    if reg in NORTH: return 'luzon_north'
    if reg in VISAYAS: return 'visayas'
    if reg in MINDANAO: return 'mindanao'
    return 'luzon_south'

index = json.load(open(os.path.join(SRC, 'index.json'), encoding='utf-8'))
region_name = {r['code'][:2]: r['name'] for r in index['regions']}
region_of = {}
for r in index['regions']:
    for p in r['provinces']: region_of[p['code']] = r['code'][:2]
    for i in r['independent']: region_of[i['code']] = r['code'][:2]

areas = [json.load(open(f, encoding='utf-8')) for f in glob.glob(os.path.join(SRC, 'areas', '*.json'))]
prov_by_name = {}
for a in areas:
    if a['kind'] == 'province': prov_by_name[titled(a['name']).lower()] = a

groups = collections.OrderedDict()            # key -> {'name','reg','cities':[...]}
def group_for(a):
    reg = region_of[a['code']]
    if reg == '13': return 'NCR', 'Metro Manila (NCR)', '13'
    if a['kind'] == 'independent_city':
        p = prov_by_name[INDEPENDENT_TO_PROVINCE[bare(a['name'])].lower()]
        return group_for(p)
    name = titled(a['name'])
    if 'special geographic area' in name.lower(): return 'SGA', 'Special Geographic Area (BARMM)', reg
    return a['code'][2:5], name, reg

for a in areas:
    key, pname, reg = group_for(a)
    g = groups.setdefault(key, {'name': pname, 'reg': reg, 'cities': []})
    for c in a['cities']:
        brgys = c['barangays']
        if any(len(b) > 2 for b in brgys):   # Manila: barangays carry their district → one entry per district
            by_d = collections.defaultdict(list)
            for b in brgys: by_d[clean(b[2])].append(clean(b[1]))
            for d, names in by_d.items():
                g['cities'].append({'code': c['code'][:5] + '-' + re.sub(r'[^A-Za-z0-9]', '', d), 'name': 'Manila – ' + d, 'b': names})
        else:
            g['cities'].append({'code': c['code'], 'name': city_name(c['name']), 'b': [clean(b[1]) for b in brgys]})

shutil.rmtree(OUT, ignore_errors=True); os.makedirs(os.path.join(OUT, 'cities'))
provinces, idx, total_b, total_c = [], [], 0, 0
for key, g in groups.items():
    pz = province_zone(g['name'], g['reg'])
    out = []
    for c in g['cities']:
        if not c['b']: continue
        z = pz
        if g['name'] == 'Batangas': z = BATANGAS_TOWNS.get(re.sub(r' City$', '', c['name']), 'other_batangas')
        if g['name'] == 'Quezon' and c['name'] == 'Lucena City': z = 'lucena'
        out.append({'c': c['code'], 'n': c['name'], 'z': z, 'b': sorted(set(c['b']), key=str.lower)})
        total_b += len(set(c['b']))
    out.sort(key=lambda x: x['n'].lower()); total_c += len(out)
    json.dump(out, open(os.path.join(OUT, 'cities', key + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    provinces.append({'k': key, 'n': g['name'], 'r': region_name[g['reg']], 'z': pz})
    idx += [{'c': c['c'], 'n': c['n'], 'k': key, 'z': c['z']} for c in out]
provinces.sort(key=lambda p: p['n'].lower())
idx.sort(key=lambda x: (x['n'].lower(), x['k']))
json.dump({'source': 'PSA Philippine Standard Geographic Code (PSGC), as of ' + index.get('published', '?') + ' — https://psa.gov.ph/classification/psgc',
           'published': index.get('published'), 'provinces': provinces},
          open(os.path.join(OUT, 'provinces.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
json.dump(idx, open(os.path.join(OUT, 'cities-index.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(f"PSGC as of {index.get('published')}: {len(provinces)} provinces, {total_c} cities/municipalities (Manila by district), {total_b} barangays → {os.path.normpath(OUT)}")
