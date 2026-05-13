import GerdauHeader from '../gerdauHeader/gerdauHeader'

class GestaoUsersInternosPage extends GerdauHeader {

    get pesquisarInput() { return cy.xpath('/html/body/div[1]/header/div[1]/div/div/div/div[2]/div/input') }
    get limparFiltroButton() { return cy.xpath('/html/body/div[1]/header/div[1]/div/button') }

}

export default new GestaoUsersInternosPage;