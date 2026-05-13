import GerdauHeader from "../gerdauHeader/gerdauHeader";

class PedidosPage extends GerdauHeader{

  get acessarPedidosButton() { return cy.xpath('/html/body/div[1]/div[2]/div/div[2]/nav/ul/li[3]') }
  get headerPedidos() { return cy.xpath('/html/body/div[1]/section/header')}
  get estadoInput() { return cy.xpath('/html/body/div[1]/div[3]/header/div/div/div[1]/div/div[2]/div/input') }
  get listaEstados() { return cy.xpath('/html/body/div[3]/div/div/div/ul') }
  get emissorInput() { return cy.xpath('/html/body/div[1]/div[3]/header/div/div/div[2]/div/div[2]/div/input') }
  get listaEmissores() { return cy.xpath('/html/body/div[5]/div/div/div/ul') }
  get dataInicioInput() { return cy.xpath('/html/body/div[1]/div[3]/header/div/div/div[3]/div/div[2]/div/div/div[1]/input[1]') }
  get dataFimInput() { return cy.xpath('/html/body/div[1]/div[3]/header/div/div/div[3]/div/div[2]/div/div/div[1]/input[2]') }
  get buscarPedidosButton() { return cy.xpath('/html/body/div[1]/div[3]/header/div/div/button[1]') }
  get exportarCarteiraButton() { return cy.xpath('/html/body/div[1]/div[3]/header/div/div/button[2]') }

}

export default new PedidosPage();