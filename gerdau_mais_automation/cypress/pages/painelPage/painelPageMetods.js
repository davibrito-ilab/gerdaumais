import PainelPage from "./painelPage";

class PainelPageMetods extends PainelPage{

  buscaremissor(emissorText) {
    this.emissorInput.click();
    this.emissorInput.type(emissorText);
    this.buscarButton.click();
  }

  validarCarregamentodoPainel() {
    this.emissorInput.should('be.visible');
    cy.url().should('contain', '/dashboard');
  }
}

export default new PainelPageMetods();