import PedidosPage from "./pedidosPage";

class PedidosPageMetods extends PedidosPage{

  selecionaEstado(estados) {
    this.estadoInput.click();
    this.estadoInput.clear();

    const marcaCheckbox = (estado) => {
    this.listaEstados.find(`li[value="${estado}"]`).click();
    };

    if (Array.isArray(estados)) {
        estados.forEach(estado => {
        marcaCheckbox(estado);
        });
    } else {
        marcaCheckbox(estados);
    }
  }

  selecionaEmissor(emissores) {
    this.emissorInput.clear();

    const marcaCheckbox = (emissor) => {
    this.listaEstados.find(`li[value="${emissor}"]`).click();
    };

    if (Array.isArray(emissores)) {
        estados.forEach(emissor => {
        marcaCheckbox(emissor);
        });
    } else {
        marcaCheckbox(emissores);
    }
  }
  
  selecionaPeriodoDeCriacao(dataInicio, dataFim) {
    this.dataInicioInput.click();
    this.dataInicioInput.clear();
    this.dataInicioInput.type(dataInicio);
    this.dataFimInput.click();
    this.dataFimInput.clear();
    this.dataFimInput.type(dataFim);
  }

  buscarPedidos() {
    this.buscarPedidosButton.click();
  }

  exportarCarteira() {
    this.exportarCarteiraButton.click();
  }

  validarCarregamentodoPedidos() {
    this.headerPedidos.should('be.visible');
    cy.url().should('contain', '/orders');
  }
}

export default new PedidosPageMetods();