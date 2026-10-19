import React from 'react';
import{motion}from'motion/react';
export default function CloseGameOverlay({game,phase,onCancel,onRequest,onForce}){
  const closing=phase==='closing',force=phase==='force';
  return <motion.div className="game-close-overlay" role="dialog" aria-modal="true" aria-label={'Fechar '+(game?.name||'jogo')}
    initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.32}}>
    <div className="game-close-aura"/>
    <motion.div className="game-close-content" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.32}}>
      <span className="game-close-label">PORTDECK · CONTROLE DO JOGO</span>
      <div className={'game-close-spinner'+(closing?' is-spinning':'')} aria-hidden="true"/>
      <h2>{closing?'Fechando jogo...':force?'O jogo ainda está aberto':'Fechar este jogo?'}</h2>
      <p>{closing?'Aguardando o Windows encerrar o processo iniciado pelo PortDeck.':
        force?'O encerramento normal não foi concluído. Forçar o fechamento pode causar perda de progresso não salvo.':
        'Tente salvar seu progresso antes de encerrar. O PortDeck solicitará primeiro um fechamento normal.'}</p>
      <div className="game-close-title">{game?.name||'Jogo'}</div>
      <div className="game-close-buttons">
        {!closing&&<button onClick={onCancel}>Cancelar</button>}
        {phase==='confirm'&&<button className="game-close-primary" onClick={onRequest}>Fechar normalmente</button>}
        {force&&<button className="game-close-force" onClick={onForce}>Forçar encerramento</button>}
      </div>
      {closing&&<small>Se demorar, você poderá escolher o que fazer.</small>}
    </motion.div>
  </motion.div>;
}