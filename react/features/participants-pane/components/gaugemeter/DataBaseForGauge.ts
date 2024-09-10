
import Participante from "./Participante";
import { getRoomName } from "../../../base/conference/functions"
import { IReduxState } from "../../../app/types";
import { REDUCER_KEY } from "../../constants";
import { getParticipantById } from "../../../base/participants/functions";
import { getTrackByJitsiTrack } from "../../../base/tracks/functions.any";
import { IParticipant } from "../../../base/participants/types";
class DataBaseForGauge {

  static participantes: Participante[];
  static state: IReduxState;
  static clearData(): void {
    this.participantes = [];
  }

  static setState(state: IReduxState): void {
    this.state = state;
  }
  static carregarParticipantes(id: string | string[] | any): void {

    const type = this.checkIsType(id);

    /**
     * ------------------------------------------------
     * Processa o participante individualmente. 
     * @param key - UniqueId do participante
     * ------------------------------------------------
     */
    const processarParticipante = (key: string) => {
      
      console.log(` === Processando chave: ${key} no foreach em carregarParticipantes ===`);
      if (!this.hasParticipante(key)) {
        let room: string | undefined = '';
        try {
          room = getRoomName(this.state)
        } catch (erro) {
          room = 'Coloque a sala em outro local em funcoes'
          console.error("Erro assíncrono capturado:", erro);

          const participante: Participante = new Participante(key, room);
          const partic: IParticipant | undefined = getParticipantById(this.state, key);

          if (partic) {
            participante.avatarURL = partic.avatarURL ?? participante.avatarURL;
            participante.displayName = partic.displayName ?? participante.displayName;
            participante.dominantSpeaker = partic.dominantSpeaker ?? participante.dominantSpeaker;
            participante.entradaNaSala = partic.raisedHandTimestamp ?? participante.entradaNaSala;
          }

          this.participantes.push(participante);
        }
      };

    }
    console.log(` === Processando chave: ${id}, type ${type}, room: ${room} em carregarParticipantes ===`);

    if (type === 'array') {
      id.forEach((key: string) => processarParticipante(key));
    } else if (type === 'string') {
      processarParticipante(id);
    }
    console.log(` === sala ${room} em carregarParticipantes ===`, this.participantes);
  }

  static checkIsType(id: any): string | undefined {
    try {
      if (id === undefined || id === null) {
        return 'undefined';
      } else if (typeof id === 'string') {
        return 'string';
      } else if (Array.isArray(id)) {
        return 'array';
      } else {
        return 'other';
      }
    } catch (erro) {
      console.error("Erro assíncrono capturado:", erro);
      return erro;
    }
  }

  static async hasParticipante(id: string): Promise<boolean> {
    const found = DataBaseForGauge.participantes.some((participante) => {
      return participante.id === id;
    });
    return !found;
  }

  // Retorna os participantes ordenados para o calculo de gine
  async getParticipantes(): Promise<Participante[]> {
    /**
     * Cria o vetor de participantes para calculo do GINI
     */
    const participantesFinal = DataBaseForGauge.participantes.slice().sort((a, b) => a.tempoDeFala - b.tempoDeFala);

    //------------------------------------------------------- 
    // COLUNA 3 do artigo
    // Calcula o fatorDeRiquezaAbsoluta de cada participante
    // Total de tempo de fala = Sigma(f)
    //------------------------------------------------------- 
    const totalTempoDeFalaEmSegundos = DataBaseForGauge.participantes.reduce(
      (total, participante) => total + parseInt(participante.tempoDeFala.toString()), 0
    );
    let index = 0;
    participantesFinal.forEach((participante) => {
      participantesFinal[index].fatorRiquezaAbsoluta =
        (participantesFinal[index].tempoDeFala / totalTempoDeFalaEmSegundos);
      ++index;
    });

    //------------------------------------------------------- 
    // COLUNA 5 do artigo
    // Proporcao do tempo de presença de cada participante
    // Total de tempo de fala = Sigma(f)
    //------------------------------------------------------- 

    const totalTempoDePresença = DataBaseForGauge.participantes.reduce(
      (total, participante) => total + parseInt(participante.tempoPresenca.toString()), 0
    );

    console.log('totalTempoPresenca=', totalTempoDePresença);
    index = 0;
    participantesFinal.forEach((participante) => {
      participantesFinal[index].fatorTempoPresenca =
        (participantesFinal[index].tempoPresenca / totalTempoDePresença);
      ++index;
    });

    //------------------------------------------------------- 
    // COLUNA 6 do artigo
    // Proporcao de tempo de presenca ACUMULADA DA POPULACAO
    //-------------------------------------------------------  

    index = 0;
    let fatorTempoPresencaAcumuladoAnterior = 0;
    participantesFinal.forEach((participante) => {
      participantesFinal[index].fatorAcumuladoPresenca =
        (participantesFinal[index].fatorTempoPresenca + fatorTempoPresencaAcumuladoAnterior);
      fatorTempoPresencaAcumuladoAnterior =
        participantesFinal[index].fatorAcumuladoPresenca;
      ++index;
    });

    //------------------------------------------------------- 
    // COLUNA 7 do artigo
    // Acumulo da proporção dos tempos de fala
    // Riqueza relativa acumulada - ponto da curva Lorenz
    //-------------------------------------------------------  
    index = 0;
    let fatorAcumuladoLorenz = 0;
    participantesFinal.forEach((participante) => {
      participantesFinal[index].fatorAcumuladoCurvaLorenz =
        (participantesFinal[index].fatorRiquezaAbsoluta + fatorAcumuladoLorenz);
      fatorAcumuladoLorenz =
        participantesFinal[index].fatorAcumuladoCurvaLorenz;
      ++index;
    });
    return participantesFinal;
  }

  async getParticipantesPercentualAcumuloFala(): Promise<Participante[]> {
    const participantesOrdenadosDescrescente = DataBaseForGauge.participantes.slice().sort((a, b) => b.tempoDeFala - a.tempoDeFala);
    return participantesOrdenadosDescrescente;
  }

  async calcularGini(): Promise<number> {
    console.log("Colecao de participantes com o calculo de Gini: ", await this.getParticipantes());

    // Participantes ordenados de forma decrescente
    const participantesOrdenados = DataBaseForGauge.participantes.slice().sort((a, b) => b.tempoDeFala - a.tempoDeFala);
    console.log("Colecao de participantes: ", participantesOrdenados);

    /*
      Calcula a soma acumulativa dos tempos de fala dos participantes
    */

    const ocupantesDaSala = DataBaseForGauge.participantes.length;
    const somaAcumulativaTempo = participantesOrdenados.reduce((soma, participante) => {
      soma += participante.tempoDeFala;
      return soma;
    }, 0);

    console.log("Soma dos tempos:", somaAcumulativaTempo);
    console.log("Ocupantes da Sala:", ocupantesDaSala);

    /*
    Participantes ordenados de forma crescente
     */
    const participantesOrdenadosCrescente = DataBaseForGauge.participantes.slice().sort((a, b) => a.tempoDeFala - b.tempoDeFala);
    /*
    Remove o ultimo elemento da coleção conforme descrito na formula.
    */
    participantesOrdenadosCrescente.pop();

    /*
    Calculo Final do Gini e do participometro´ usando 1-formula
    */
    let fiAnterior = 0;
    let index = 0;
    const ultimaPosicao = participantesOrdenadosCrescente.length - 1;
    let somatorioFi = 0;
    let ultimoElemento = 0;
    participantesOrdenadosCrescente.forEach((participante) => {
      somatorioFi += ((fiAnterior + participante.fatorAcumuladoCurvaLorenz) * participante.fatorTempoPresenca);
      fiAnterior = participante.fatorAcumuladoCurvaLorenz;
      if (index === ultimaPosicao) {
        ultimoElemento = participante.fatorAcumuladoPresenca;
      }
      ++index;
    });

    /*
    Calculo final do Gini´ usando a formula do artigo
    */
    const giniIndex = (somatorioFi / (ultimoElemento ** 2));
    return giniIndex;
  }

  async calcularMediaTempoDeFala(): Promise<number> {
    if (DataBaseForGauge.participantes.length === 0) {
      console.log("Não encontrei participantes para calcular a média");
      return 0;
    }

    const totalTempoDeFalaEmMinutos = DataBaseForGauge.participantes.reduce(
      (total, participante) => total + parseInt(participante.tempoDeFala.toString()), 0
    );
    return totalTempoDeFalaEmMinutos / DataBaseForGauge.participantes.length;
  }
}

export default DataBaseForGauge;

