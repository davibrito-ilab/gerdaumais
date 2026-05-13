import GerdauHeader from '../gerdauHeader/gerdauHeader'

class SuportePage extends GerdauHeader {

    get pesquisaSuporteInput() { return cy.xpath('/html/body/div[1]/div[3]/div[1]/form/div/div/div[2]/div/input') }
    get buscaSuporteButton() { return cy.xpath('/html/body/div[1]/div[3]/div[1]/form/button') }

}

export default new SuportePage;