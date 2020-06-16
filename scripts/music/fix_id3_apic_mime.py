# mimeがbytesリテラルになっていたのを修正

import sys
import glob
from mutagen.id3 import ID3

for f in glob.glob('./storage/music/**/*.mp3', recursive=True):
  try:
    t = ID3(f)
  except:
    continue

  pics = t.getall('APIC')
  if len(pics) == 0:
    continue
  if len(pics) > 1:
    print('multiple coverart:', f)

  pic = pics[0]
  if pic.mime.startswith('image'):
    if pic.mime != 'image/png' and pic.mime != 'image/jpeg':
      print(f, pic.mime)
    continue
  if pic.mime.endswith('png\''):
    print(f, pic.mime, '=>', 'image/png')
    pic.mime = 'image/png'
  elif pic.mime.endswith('jpeg\''):
    print(f, pic.mime, '=>', 'image/jpeg')
    pic.mime = 'image/jpeg'
  else:
    print(f, pic.mime)
  if len(sys.argv) > 1 and sys.argv[1] == 'run':
    t.setall('APIC', [pic])
    t.save(f)
