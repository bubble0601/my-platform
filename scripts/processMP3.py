import sys
import mutagen.mp3 as mp3
import mutagen.id3 as id3

def main():
  if len(sys.argv) < 3:
    sys.exit(1)
  cmd = sys.argv[1]
  target = sys.argv[2]

  if cmd == "init":
    init(target)
  elif cmd == 'addpic':
    if len(sys.argv) < 4:
      sys.exit(1)
    addpic(target, sys.argv[3])

# convert to ID3v2.3 and outputs info
def init(filename):
  audio = mp3.MP3(filename)
  print(int(audio.info.length), end='')

  tags = id3.ID3(filename, v2_version=3)
  available_tags = {
    'TIT2': 'Title',
    'APIC': 'Artwork',
    'TPE1': 'Artist',
    'TPE2': 'AlbumArtist',
    'TALB': 'Album',
    'TYER': 'Year',
    'TRCK': 'Track',
    'TPOS': 'Disc',
    'USLT': 'Lyric',
    'TCON': 'Genre',
  }
  save_tags = []
  delete_tags = []
  for tag_name in tags:
    if tag_name[:4] in available_tags.keys():
      tag = tags.getall(tag_name)
      if tag_name[:4] != 'APIC':
        tag[0].encoding = id3.Encoding.UTF16
      tag = [tag[0]]
      save_tags.append((tag_name, tag))
    else:
      delete_tags.append(tag_name)

  for tag in save_tags:
    tags.setall(tag[0], tag[1])
  for tag_name in delete_tags:
    tags.delall(tag_name)

  tags.save(v1=id3.ID3v1SaveOptions.REMOVE, v2_version=3)

def addpic(mp3file, imgfile):
  type = None
  if imgfile.endswith('png'):
    type = "image/png"
  elif imgfile.endswith('jpg') or imgfile.endswith('jpeg'):
    type = "image/jpeg"
  else:
    sys.exit(1)
  tag = id3.ID3(mp3file, v2_version=3)
  with open(imgfile).read() as f:
    tag.add(id3.APIC(
      encoding=id3.Encoding.UTF16,
      mime=type,
      type=id3.PictureType.COVER_FRONT,
      data=f.read()
    ))
  tag.save()

if __name__ == "__main__":
  main()
