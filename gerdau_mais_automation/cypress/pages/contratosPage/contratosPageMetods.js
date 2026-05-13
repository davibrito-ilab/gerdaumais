import ContratosPage from './contratosPage'

class ContratosPageMetods extends ContratosPage {

    navegarParaContratosObras () {
        this.acessarContratosButton.click()
    }

    buscarContratoBP (bp) {
        this.BPInput.type(bp);
        this.buscarButton.click();
    }

    validaCarregamentoContratosObras () {
        this.BPInput.should('be.visible');
        cy.url().should('contain', '/contracts-constructions')
    }

}

export default new ContratosPageMetods;