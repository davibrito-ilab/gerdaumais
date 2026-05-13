import GestaoUsersPage from './gestaoUsersPage';

class GestaoUsersPageMetods extends GestaoUsersPage {

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

export default new GestaoUsersPageMetods;