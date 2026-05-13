import GerdauHeader from '../gerdauHeader/gerdauHeader'

class GestaoUsersPage extends GerdauHeader {

    get pesquisarInput() { return cy.xpath('/html/body/div[1]/div[3]/div/div[1]/div/div/div/div[2]/div/input') }
    get limparFiltroButton() { return cy.xpath('/html/body/div[1]/div[3]/div/div[1]/div/button') }

    pesquisarUserInterno (usuario) {
        this.pesquisarInput.type(usuario);
    }

    limparFiltro (usuario) {
        this.pesquisarInput.type(usuario);
        this.limparFiltroButton.click();
    }

    validaCarregamentoGestaoUsersInternos () {
        this.pesquisarInput.should('be.visible');
        cy.url().should('contain', '/access-management')
    }

}

export default new GestaoUsersPage;