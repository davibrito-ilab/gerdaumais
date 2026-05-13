import GestaoUsersInternosPage from './gestaoUsersInternosPage';

class GestaoUsersInternosPageMetods extends GestaoUsersInternosPage {

    pesquisarUserInterno (usuario) {
        this.pesquisarInput.type(usuario);
    }

    limparFiltro (usuario) {
        this.pesquisarInput.type(usuario);
        this.limparFiltroButton.click();
    }

    validaCarregamentoGestaoUsersInternos () {
        this.pesquisarInput.should('be.visible');
        cy.url().should('contain', '/access-internal-management')
    }

}

export default new GestaoUsersInternosPageMetods;