import MaquetesPage from './maquetesPage';

class MaquetesPageMetods extends MaquetesPage {

    navegarParaMaquetes () {
        this.acessarMaquetesButton.click()
    }

    buscarMaquete (contrato) {
        this.contratoInput.type(contrato);
        this.buscarMaquetesButton.click();
    }

    validaCarregamentoMaquetes () {
        this.emissorInput.should('be.visible');
        cy.url().should('contain', '/projects-mockup')
    }

}

export default new MaquetesPageMetods;