import GerdauHeader from "../gerdauHeader/gerdauHeader";

class ConfigPage extends GerdauHeader {

    get configNotificacoes() { return cy.xpath('/html/body/div[1]/section/div/div/div[1]/div[1]/div/div[1]')}
    get recebimentoCarteiraCheckbox() { return cy.xpath('/html/body/div[1]/section/div/div/div[2]/div/div/div/div[2]/div[1]/div[2]/input')}
    get vencimentoLimiteCheckbox() { return cy.xpath('/html/body/div[1]/section/div/div/div[2]/div/div/div/div[2]/div[2]/div[2]/input')}

}

export default ConfigPage;