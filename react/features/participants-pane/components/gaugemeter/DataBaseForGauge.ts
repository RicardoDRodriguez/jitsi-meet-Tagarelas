
import Participante from "./Participante";
import { getRoomName } from "../../../base/conference/functions"
import { IReduxState } from "../../../app/types";
import { REDUCER_KEY } from "../../constants";
import { getParticipantById } from "../../../base/participants/functions";
import { getTrackByJitsiTrack } from "../../../base/tracks/functions.any";
import { IParticipant } from "../../../base/participants/types";
import conference from "../../../../../conference";
class DataBaseForGauge {

  static participantes: Participante[] = [];
  static state: IReduxState;
  static room: String = '';
  static conference: any;
  /**
   * Limpa os dados do banco de dados
   */
  static clearData(): void {
    this.participantes = [];
  }
  /**
   * Carrega o estado do programa chamador
   * @param state tipo IReduxState
   * @param conference tipo conference
   */
  static setStateAndConference(state: IReduxState, conference: any): void {
    this.state = state;
    this.conference = conference;
  }



  /**
   * Determina a forma pela qual os ids de quem faz parte da 
   * videoconferência são recebidos: Normalmente Array ou Strung
   * 
   * @param id - GUID do participante
   * @returns O tipo da variável
   */
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

  /**
  * Verifica se o participante já se encontra na lista de participantes
  * 
  * @param id identificador do participante
  * @returns found or nor found
  */
  static hasParticipante(id: string): boolean {

    let found: boolean = true;

    /**
     * Se não existirem participantes no vetor retorna ! found
     */
    if (this.participantes.length === 0) {
      return !found;
    }

    try {
      const found = this.participantes.some((participante) => {
        return participante.id === id;
      });
    } catch (erro) {
      console.log(`Ocorreu o erro de verificar se existe o participante ${erro}`)
    } finally {
      return found;
    }

  }

  static carregarEstatisticasParticipante(key: string): void {
    conference.getSpeakerStats();

  }



  /**
   * 
   * @param key Insere o objeto participant no componente participante
   * @returns void
   */
  static processarParticipante(key: string, room: string): void {

    console.log(` === Processando chave: ${key} no foreach em carregarParticipantes ===`);
    if (!this.hasParticipante(key)) {
      console.log(` === Chave não encontrada: ${key} no foreach em carregarParticipantes ===`);
      /**
       * Constroi o array de participante
       */
      const participante: Participante = new Participante(key, room);
      const partic: IParticipant | undefined = getParticipantById(this.state, key);
      if (partic) {
        const speakerStats = this.conference.getSpeakerStats();

        for (const userId in speakerStats) {
          if (userId === key){
            console.log(`=== encontrei em SpeakerStats ${key}: `, speakerStats );
            const stats = speakerStats[userId];
            participante.tempoDeFala = stats.totalDominantSpeakerTime ?? participante.tempoDeFala;     
            break; // Encontrei e sai fora.
          }
        }

        participante.avatarURL = partic.avatarURL ?? participante.avatarURL;
        participante.displayName = partic.displayName ?? participante.displayName;
        participante.dominantSpeaker = partic.dominantSpeaker ?? participante.dominantSpeaker;
        participante.entradaNaSala = partic.raisedHandTimestamp ?? participante.entradaNaSala;

        this.participantes.push(participante);

      };
    }
    return
  }


  /**
   * Carrega a lista de participantes para ser processada por GaugeMeter
   * @param id lista de participants
   * 
   */
  static carregarParticipantes(id: string | string[] | any): void {

    // Verifica o tipo da variavel
    const type = this.checkIsType(id);
    console.log(` === Processando chave:`, id);
    console.log(` === Processando type:`, type);

    // Carrega o nome da sala
    let room: String | undefined = '';
    try {
      room = getRoomName(this.state) ?? room;
    } catch (erro) {
      room = 'Coloque a sala em outro local em funcoes'
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
      console.log(` === Resultado Final => sala ${room} em carregarParticipantes ===`, this.participantes);
    } catch (erro) {
      console.log(` === Tentativa de processar lista de participantes acarretou em erro ${erro} ===`);
    }
    return
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

