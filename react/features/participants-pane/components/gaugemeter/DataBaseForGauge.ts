// DataBaseForGauge.ts
import Participante from "./Participante";
import { IReduxState } from "../../../app/types";
import { getParticipantById } from "../../../base/participants/functions";
import { IParticipant } from "../../../base/participants/types";
import { getRoomName } from "../../../base/conference/functions";
import { getSortedParticipantIds } from "../../functions";

class DataBaseForGauge {

  static participantes: Participante[] = [];
  static state: IReduxState;
  static room: string = '';
  static conference: any;

  async clearData(): Promise<void> {
    DataBaseForGauge.participantes = [];
  }

  async percorrerParticipantes(): Promise<void> {
    console.log("Percorrendo todos os participantes:");
    DataBaseForGauge.participantes.forEach((participante) => {
      console.log(participante);
    });
  }
  /**
   * Carrega Participantes de functions de participants-pane
  **/ 
  async loadParticipantes(): Promise<void> {
    this.setStateAndConference();
    let sortedParticipantIds: any = getSortedParticipantIds(DataBaseForGauge.state);
    console.log(`=== 1. Limpando os dados de DataBaseForGauge e mostrando sortedParticipantIds`, sortedParticipantIds)
    this.clearData();
    //console.log(`=== 2. carregando a variavel local`, local)
    //this.carregarParticipantes(local);
    //console.log(`=== 3. carregando a variavel remoteRaisedHandParticipants`, iRemoteRaisedHandParticants)
    //this.carregarParticipantes(iRemoteRaisedHandParticants);
    console.log(`=== 4. carregando a variavel iReorderedParticipants`, sortedParticipantIds)
    this.carregarParticipantes(sortedParticipantIds);

  }

  /**
   * Carrega o estao e a conferencia
  **/ 

  async setStateAndConference(): Promise<void> {
    DataBaseForGauge.state = APP.store.getState();
    DataBaseForGauge.conference = APP.conference;
  }

  /**
   * checa o tipo de participante.
   * @param id Id so Particioante
   * @returns String do tipo de participante.
   */

  checkIsType(id: any): string {
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
    } catch (error) {
      console.error("Erro assíncrono capturado:", error);
      return "Não foi possivel definir o tipo de id";
    }
  }

  hasParticipante(id: string): boolean {
    let found: boolean = true;

    if (DataBaseForGauge.participantes.length === 0) {
      return !found;
    }

    try {
      const found = DataBaseForGauge.participantes.some((participante) => {
        return participante.id === id;
      });
    } catch (erro) {
      console.log(`Ocorreu o erro de verificar se existe o participante ${erro}`);
    } finally {
      return found;
    }
  }

  /**
   * Carrega a lista de participantes para ser processada por GaugeMeter
   * @param id lista de participants
   * 
   */
  async carregarParticipantes(id: string | string[] | any): Promise<void> {

    // Verifica o tipo da variavel
    const type = this.checkIsType(id);
    console.log(` === Processando chave:`, id);
    console.log(` === Processando type:`, type);

    // Carrega o nome da sala
    let room: String = '';
    try {
      room = getRoomName(DataBaseForGauge.state) ?? room;
    } catch (erro) {
      room = 'Não acheia a Sala'
      console.error(" === Erro assíncrono capturado:", erro);
    }


    try {
      /**
       * Se o tipo de participants do sitema jitsi for um array ou um String
       */
      if (type === 'array') {
        /**
         * Não processa nada se não houver lista
         */
        if (id.length == 0) {
          console.log(` === sala ${room} Lista de ids vazia ===`);
          return
        }

        id.forEach((key: string) => this.processarParticipante(key, room?.toString()));
      } else if (type === 'string') {
        this.processarParticipante(id, room?.toString());
      }
      /**
       * Checar se no final conseguimos alimentar participantes.
       */
      console.log(` === Resultado Final => sala ${room} em carregarParticipantes ===`, DataBaseForGauge.participantes);
    } catch (erro) {
      console.log(` === Tentativa de processar lista de participantes acarretou em erro ${erro} ===`);
    }
    return
  }

  async getParticipantesPercentualAcumuloFala(): Promise<Participante[]> {
    this.loadParticipantes()
    const participantesOrdenadosDescrescente = DataBaseForGauge.participantes.slice().sort((a, b) => b.tempoDeFala - a.tempoDeFala);
    return participantesOrdenadosDescrescente;
  }


  async calcularGini(): Promise<number> {
    await this.loadParticipantes();

    console.log("Colecao de participantes com o calculo de Gini: ", DataBaseForGauge.participantes);

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

  processarParticipante(key: string, room: string): void {
    console.log(` === Processando chave: ${key} no foreach em carregarParticipantes ===`);
    if (!this.hasParticipante(key)) {
      console.log(` === Chave não encontrada: ${key} no foreach em carregarParticipantes ===`);
      const participante: Participante = new Participante(key, room);
      const partic: IParticipant | undefined = getParticipantById(DataBaseForGauge.state, key);
      console.log(`=== Dados de partic ${key}: `, partic);
      if (partic) {
        const speakerStats = DataBaseForGauge.conference.getSpeakerStats();

        for (const userId in speakerStats) {
          if (userId === key) {
            console.log(`=== encontrei em SpeakerStats ${key}: `, speakerStats);
            const stats = speakerStats[userId];
            console.log(`=== encontrei em stats ${key}: `, stats);
            participante.tempoDeFala = stats.totalDominantSpeakerTime ?? participante.tempoDeFala;
            break;
          }
        }

        participante.avatarURL = partic.avatarURL ?? participante.avatarURL;
        participante.displayName = partic.name ?? participante.displayName;
        participante.role = partic.role ?? participante.role;
        participante.dominantSpeaker = partic.dominantSpeaker ?? participante.dominantSpeaker;
        participante.entradaNaSala = partic.raisedHandTimestamp ?? participante.entradaNaSala;

        DataBaseForGauge.participantes.push(participante);
      }
    }
  }
}

export default DataBaseForGauge;
