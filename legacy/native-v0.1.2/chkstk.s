.text
.globl __chkstk
__chkstk:
    leaq 8(%rsp), %r10
    movq %r10, %r11
    subq %rax, %r11
.Lagain:
    subq $4096, %r10
    cmpq %r11, %r10
    jb .Llast
    testb $0, (%r10)
    jmp .Lagain
.Llast:
    testb $0, (%r11)
    ret
