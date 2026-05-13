import DocumentosPage from './documentosPage'

class DocumentosPageMetods extends DocumentosPage {

    navegarParaDocumentos () {
        this.acessarDocumentosButton.click()
    }

    buscarDocumento (emissor, dataInicio, dataFim) {
        this.emissorInput.type(emissor);
        this.dataInicioInput.type(dataInicio);
        this.dataFimInput.type(dataFim);
        this.buscarDocumentosButton.click();
    }

    validaCarregamentoDocumentos () {
        this.emissorInput.should('be.visible');
        cy.url().should('contain', '/download-area')
    }

}

export default new DocumentosPageMetods;