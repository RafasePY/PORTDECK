typedef unsigned long long SIZE_T;
void *memset(void *p,int c,SIZE_T n){unsigned char *d=(unsigned char*)p;for(SIZE_T i=0;i<n;i++)d[i]=(unsigned char)c;return p;}
void *memcpy(void *dst,const void *src,SIZE_T n){unsigned char*d=(unsigned char*)dst;const unsigned char*s=(const unsigned char*)src;for(SIZE_T i=0;i<n;i++)d[i]=s[i];return dst;}
