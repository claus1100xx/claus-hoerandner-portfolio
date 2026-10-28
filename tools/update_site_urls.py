"""Regenerate static SEO URLs from site.config.json. No packages required."""
from pathlib import Path
from urllib.parse import urljoin, urlparse
import json,re

ROOT=Path(__file__).resolve().parents[1]
def update():
    config=json.loads((ROOT/'site.config.json').read_text(encoding='utf-8'))
    base=config['base_url'].rstrip('/')+'/'
    if urlparse(base).scheme not in ('https','http'):raise ValueError('base_url must use HTTP or HTTPS')
    image=urljoin(base,config['social_image'])
    for page in ROOT.glob('*.html'):
        text=page.read_text(encoding='utf-8')
        url=base if page.name=='index.html' else urljoin(base,page.name)
        canonical=f'<link rel="canonical" href="{url}">'
        pattern=r'<link\b(?=[^>]*\brel=["\']canonical["\'])[^>]*>'
        if re.search(pattern,text,re.I):text=re.sub(pattern,lambda _:canonical,text,flags=re.I)
        else:text=text.replace('</head>',canonical+'\n</head>',1)
        for name,value in [('og:url',url),('og:image',image)]:
            meta=f'<meta property="{name}" content="{value}">'
            pattern=r'<meta\b(?=[^>]*\b(?:property|name)=["\']'+re.escape(name)+r'["\'])[^>]*>'
            if re.search(pattern,text,re.I):text=re.sub(pattern,lambda _:meta,text,flags=re.I)
            else:text=text.replace('</head>',meta+'\n</head>',1)
        text=re.sub(r'<meta\b(?=[^>]*\bname=["\']twitter:image["\'])[^>]*>',lambda _:f'<meta name="twitter:image" content="{image}">',text,flags=re.I)
        page.write_text(text,encoding='utf-8')
    card=ROOT/'Claus_Hoerandner.vcf'
    if card.exists():
        text=card.read_bytes().decode('utf-8')
        # Fold content lines to the vCard limit and retain CRLF line endings.
        lines=text.replace('\r\n ','').replace('\r\n','\n').splitlines()
        lines=[('URL:'+base) if line.startswith('URL:') else line for line in lines]
        folded=[]
        for line in lines:
            while len(line.encode('utf-8'))>75:
                split=75
                while len(line[:split].encode('utf-8'))>75:split-=1
                folded.append(line[:split]);line=' '+line[split:]
            folded.append(line)
        card.write_bytes(('\r\n'.join(folded)+'\r\n').encode('utf-8'))
    print('Static canonical and social URLs regenerated from site.config.json.')

if __name__=='__main__':update()
