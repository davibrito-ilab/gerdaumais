import GerdauHeader from '../gerdauHeader/gerdauHeader'

class ContratosPage extends GerdauHeader {

    get acessarContratosButton () { return cy.xpath('/html/body/div[1]/div[2]/div/div[2]/nav/ul/li[7]') }
    get BPInput () { return cy.xpath('/html/body/div[1]/div[3]/div/div/div/div[2]/div/input') }
    get listaBP () { return cy.xpath('/html/body/div[3]/div/div/div/ul') }
    get buscarButton () { return cy.xpath('/html/body/div[1]/div[3]/div/button') }

}

export default new ContratosPage;