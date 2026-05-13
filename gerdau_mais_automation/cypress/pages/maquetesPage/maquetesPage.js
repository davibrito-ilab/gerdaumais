import GerdauHeader from '../gerdauHeader/gerdauHeader'

class MaquetesPage extends GerdauHeader {

    get acessarMaquetesButton () { return cy.xpath('/html/body/div[1]/div[2]/div/div[2]/nav/ul/li[6]') }
    get contratoInput() { return cy.xpath('/html/body/div[1]/header/div/div/div/div[2]/div/input') }
    get listaContratos() { return cy.xpath('/html/body/div[4]/div/div/div/ul') }
    get buscarMaquetesButton() { return cy.xpath('/html/body/div[1]/div[3]/div/button') }

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

export default new MaquetesPage;