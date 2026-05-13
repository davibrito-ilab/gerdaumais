import LoginPage from "../loginPage/loginPage";

class GerdauHeader extends LoginPage{

  get headerCompleto() { return cy.get('header').first(); }
  get menuHeader() { return cy.xpath('/html/body/div[1]/div[2]/div/div[1]/header/nav/div[1]/div[2]/div') }
  get notificacoes() { return cy.xpath('/html/body/div[1]/div[2]/div/div[1]/header/nav/div[2]/div[1]') }
  get ajuda() { return cy.xpath('/html/body/div[1]/div[2]/div/div[1]/header/nav/div[2]/div[2]') }
  get carrinho() { return cy.xpath('/html/body/div[1]/div[2]/div/div[1]/header/nav/div[2]/div[3]') }
  get gestaoUsers() { return cy.xpath('/html/body/div[3]/div[2]/div[3]/ul/li[1]') }
  get visaoRecebedor() { return cy.xpath('/html/body/div[3]/div[2]/div[3]/ul/li[2]') }
  get configuracoes() { return cy.xpath('/html/body/div[3]/div[2]/div[3]/ul/li[3]') }
  get logout() { return cy.xpath('/html/body/div[3]/div[2]/div[3]/ul/li[4]') }
  get modal() { return cy.get('.hefesto-modal__overlay') }
  get fecharModal() { return cy.get('.hefesto-button--secondary > .hefesto-button__container > .ink') }
  
  abrirMenuHeader() {
    this.menuHeader.click();
  }

  abrirNotificacoes() {
    this.notificacoes.click();
  }

  navegarParaSuporte() {
    this.ajuda.click();
  }

  navegarParaCarrinho() {
    this.carrinho.click();
  }

  navegarGestaodeUsuarios() {
    this.menuHeader.click();
    this.gestaoUsers.click();
  }

  navegarVisaoRecebedor() {
    this.menuHeader.click();
    cy.wrap(this.visaoRecebedor.click());
  }

  navegarParaConfiguracoes() {
    this.menuHeader.click();
    cy.get(':nth-child(4) > span').click();
  }

  fazerLogout() {
    this.menuHeader.click();
    this.logout.click();
  }

  validarCarregamentoHeader() {
    this.headerCompleto.should('be.visible');
    cy.screenshot('paginainicial');
  }

  validarCarregamentoPaginaInicial() {
    cy.url().should('include', '/dashboard');
  }

  validaCarregamentoModal() {
    this.modal.should('be.visible');
  }

  fechaModal() {
    this.fecharModal.click({ force: true });
    this.modal.should('not.exist');
  }
}

export default GerdauHeader;