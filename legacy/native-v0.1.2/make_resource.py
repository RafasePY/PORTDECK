import struct, pathlib
ico=pathlib.Path(__file__).with_name('portdeck.ico').read_bytes()
_,typ,count=struct.unpack_from('<HHH',ico)
assert typ==1
entries=[]
for j in range(count):
    b=ico[6+j*16:6+(j+1)*16]
    width,height,colors,res,planes,bits,size,offset=struct.unpack('<BBBBHHII',b)
    entries.append((b, ico[offset:offset+size]))

def record(ty,id,data):
    def word(x):return struct.pack('<HH',0xffff,x)
    h=word(ty)+word(id)+struct.pack('<IHHII',0,0x1030,0,0,0)
    assert len(h)==24
    raw=struct.pack('<II',len(data),8+len(h))+h+data
    return raw + b'\0'*(-len(raw)%4)
res=record(0,0,b'')
for i,(ent,data) in enumerate(entries,1):res+=record(3,i,data)
group=struct.pack('<HHH',0,1,len(entries))
for i,(ent,data) in enumerate(entries,1):
    group+=ent[:12]+struct.pack('<H',i)
res+=record(14,1,group)
pathlib.Path('portdeck_icon.res').write_bytes(res)
print('Res byte size:',len(res),'icons:',count)
