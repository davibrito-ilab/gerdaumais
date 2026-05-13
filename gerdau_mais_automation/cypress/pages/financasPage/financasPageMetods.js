import FinancasPage from './financasPage';

class FinancasPageMetods extends FinancasPage{

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

export default new FinancasPageMetods;