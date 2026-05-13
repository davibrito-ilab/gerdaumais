import GerdauHeader from "../gerdauHeader/gerdauHeader";

class PainelPage extends GerdauHeader{

  get acessarPainelButton() { return cy.xpath('/html/body/div[1]/div[2]/div/div[2]/nav/ul/li[2]') }
  get emissorInput() { return cy.xpath('/html/body/div[1]/div[3]/div[1]/div/div/div[2]/div/input') }
  get buscarButton() { return cy.xpath('/html/body/div[1]/div[3]/div[1]/div/button') }

}

export default new PainelPage();