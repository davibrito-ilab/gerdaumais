import GerdauHeader from '../gerdauHeader/gerdauHeader'

class DocumentosPage extends GerdauHeader {

    get acessarDocumentosButton () { return cy.xpath('/html/body/div[1]/div[2]/div/div[2]/nav/ul/li[8]') }
    get emissorInput() { return cy.xpath('/html/body/div[1]/div[3]/div/div[1]/div/div/div[2]/div/input') }
    get listaEmissores() { return cy.xpath('/html/body/div[4]/div/div/div/ul') }
    get dataInicioInput() { return cy.xpath('/html/body/div[1]/div[3]/div/div[2]/div/div[2]/div/div/div[1]/input[1]') }
    get dataFimInput() { return cy.xpath('/html/body/div[1]/div[3]/div/div[2]/div/div[2]/div/div/div[1]/input[2]') }
    get buscarDocumentosButton() { return cy.xpath('/html/body/div[1]/div[3]/div/button') }

}

export default new DocumentosPage;