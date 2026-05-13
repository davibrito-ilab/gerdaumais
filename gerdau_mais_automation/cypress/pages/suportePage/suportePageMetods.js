import SuportePage from './suportePage';

class SuportePageMetods extends SuportePage {

    buscarOpcaodeSuporte (opt) {
        this.pesquisaSuporteInput.type(opt);
        this.buscaSuporteButton.click();
    }

    validaCarregamentoSuporte () {
        this.emissorInput.should('be.visible');
        cy.url().should('contain', '/help-center')
    }

}

export default new SuportePageMetods;