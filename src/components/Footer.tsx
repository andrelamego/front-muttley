import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <div>
          <span>Muttley</span>
          <small>Eventos academicos da Fatec Zona Leste</small>
        </div>
        <nav aria-label="Links do rodape">
          <a
            href="https://fateczl.cps.sp.gov.br/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Fatec ZL
          </a>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
