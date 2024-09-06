import { FakeParticipant, IGiniParticipant, ISourceInfo } from "./types";

class Participante implements IGiniParticipant{
    entradaNaSala: number = 0;
    tempoDeFala: number = 0;
    fatorRiquezaAbsoluta: number = 0;
    tempoPresenca: number = 0;
    fatorTempoPresenca: number = 0;
    fatorAcumuladoPresenca: number = 0;
    populacaoAcumulada: number = 0;
    percentualAcumuloFala: number = 0;
    proporcaoAcumuladaPopulacao: number = 0;
    fatorAcumuladoCurvaLorenz: number = 0;
    avatarURL: string = '';
    botType?: string = '';
    displayName: string = '';
    dominantSpeaker?: boolean | undefined;
    e2eeEnabled?: boolean | undefined;
    e2eeSupported?: boolean | undefined;
    e2eeVerificationAvailable?: boolean | undefined;
    e2eeVerified?: boolean | undefined;
    email?: string = '';
    fakeParticipant?: FakeParticipant | undefined;
    features?: { 'screen-sharing'?: boolean | string; } | undefined;
    getId?: Function | undefined;
    id: string = '';
    isJigasi?: boolean | undefined;
    isReplaced?: boolean | undefined;
    isReplacing?: number | undefined;
    jwtId?: string | undefined;
    loadableAvatarUrl?: string | undefined;
    loadableAvatarUrlUseCORS?: boolean | undefined;
    local?: boolean | undefined;
    localRecording?: string | undefined;
    name?: string | undefined;
    pinned?: boolean | undefined;
    presence?: string | undefined;
    raisedHandTimestamp?: number | undefined;
    region?: string | undefined;
    remoteControlSessionStatus?: boolean | undefined;
    role?: string | undefined;
    sources?: Map<string, Map<string, ISourceInfo>> | undefined;
    supportsRemoteControl?: boolean | undefined;
    constructor(
      sala: string,
      id: number,
      sequencia: number,
      displayName: string,
      avatar: string,
      entradaNaSala: number,
      tempoDeFala: number,
      tempoPresenca: number
    ) {
      this.id= id.toLocaleString();
      this.displayName = displayName;
      this.avatarURL = avatar;
      this.entradaNaSala = entradaNaSala;
      this.tempoDeFala = tempoDeFala;
      this.fatorRiquezaAbsoluta = 0.0;
      this.tempoPresenca = tempoPresenca;
      this.fatorTempoPresenca = 0.0;
      this.fatorAcumuladoPresenca = 0.0;
      this.populacaoAcumulada = 0.0;
      this.percentualAcumuloFala = 0.0;
      this.proporcaoAcumuladaPopulacao = 0.0;
      this.fatorAcumuladoCurvaLorenz = 0.0;
    }

  }
  
  export default Participante;
  