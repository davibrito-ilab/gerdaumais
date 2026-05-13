import ConfigPage from "./configPage";

class ConfigPageMetods extends ConfigPage {

    validarCarregamentoSettings(){
        this.configNotificacoes.should('be.visible');
        cy.url().should('contain', '/settings');
    }

    acessaConfigdeNotificacoes(){
        this.configNotificacoes.click();
    }

    selecionaCheckboxRecebimentoCarteira(){
        this.configNotificacoes.click();
        this.recebimentoCarteiraCheckbox.click();
    }

    selecionaVencimentoLimiteCheckbox(){
        this.configNotificacoes.click();
        this.vencimentoLimiteCheckbox.click();
    }
}

export default new ConfigPageMetods;