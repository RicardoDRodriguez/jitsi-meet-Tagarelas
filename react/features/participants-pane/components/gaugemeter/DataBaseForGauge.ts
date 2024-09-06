
declare const APP: any;

import Participante from "./Participante";
import {getRoomName} from "../../../base/conference/functions"
import Logger from '@jitsi/logger';
import { getParticipantById, isScreenShareParticipant } from '../../../../../react/features/base/participants/functions';
import { getSortedParticipantIds, isCurrentRoomRenamable, shouldRenderInviteButton } from '../../functions';

class DataBaseForGauge {

  static participantes: Participante[]=DataBaseForGauge.carregarParticipantes();

  static carregarParticipantes(): Participante[]{
    const logger = Logger.getLogger();
    const state = APP.store.getState();
    logger.log("=== Conference Room Name",getRoomName(state));
    let sortedParticipantIds: any = getSortedParticipantIds(state);

    // Filter out the virtual screenshare participants since we do not want them to be displayed as separate
    // participants in the participants pane.
    sortedParticipantIds = sortedParticipantIds.filter((id: any) => {
        const participant = getParticipantById(state, id);
        return !isScreenShareParticipant(participant);
    });
    console.log(`=== sortedParticipants=== ${sortedParticipantIds}`);
    return [new Participante("Aula 1 Turma 3: Apresentação dialogada", 1, 1, "Professor", "avatar", 10, 3006, 3600),
    ];
  }

  async percorrerParticipantes(): Promise<void> {
    console.log("Percorrendo todos os participantes:");
    DataBaseForGauge.participantes.forEach((participante) => {
      console.log(participante);
    });
  }

  // Retorna os participantes ordenados para o calculo de gine
  async getParticipantes(): Promise<Participante[]> {
    /**
     * Cria o vetor de participantes para calculo do GINI
     */
    DataBaseForGauge.carregarParticipantes();

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

