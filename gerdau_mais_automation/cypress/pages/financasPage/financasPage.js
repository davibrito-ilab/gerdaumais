import GerdauHeader from '../gerdauHeader/gerdauHeader'

class FinancasPage extends GerdauHeader {

    get acessarFinancasButton () { return cy.xpath('/html/body/div[1]/div[2]/div/div[2]/nav/ul/li[8]') }
    get emissorInput() { return cy.xpath('/html/body/div[1]/div[3]/div/div[1]/div/div/div[2]/div/input') }
    get listaEmissores() { return cy.xpath('/html/body/div[4]/div/div/div/ul') }
    get statusFaturaInput() { return cy.xpath('/html/body/div[1]/header/div/div[2]/div/div[2]/div/input') }
    get listaStatus() { return cy.xpath('/html/body/div[4]/div/div/div/ul/li[1]') }
    get dataInicioInput() { return cy.xpath('/html/body/div[1]/div[3]/div/div[2]/div/div[2]/div/div/div[1]/input[1]') }
    get dataFimInput() { return cy.xpath('/html/body/div[1]/div[3]/div/div[2]/div/div[2]/div/div/div[1]/input[2]') }
    get buscarFinancasButton() { return cy.xpath('/html/body/div[1]/div[3]/div/button') }

    navegarParaFinancas () {
        this.acessarFinancasButton.click()
    }

    buscarFinanca (emissor, status) {
        this.emissorInput.type(emissor);
        this.statusFaturaInput.type(status);
        this.buscarFinancasButton.click();
    }

    validaCarregamentoFinancas () {
        this.emissorInput.should('be.visible');
        cy.url().should('contain', '/financials')
    }

}

export default new FinancasPage;