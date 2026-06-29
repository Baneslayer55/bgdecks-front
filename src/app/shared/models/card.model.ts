export interface ArtistDto {
  id: number;
  nickname: string;
  firstName: string;
  lastName: string;
}

export interface SetInfoDto {
  id: number;
  release: string;
  name: string;
  isStandard: boolean;
  isLimited: boolean;
}

export interface CardParamsDto {
  id: number;
  cost?: number;
  type?: string;
  attack?: number;
  health?: number;
  text?: string;
  bannedIn?: string[];
  classes?: string[];
  elements?: string[];
}

export interface Card {
  id: number;
  name: string;
  rarity?: string;
  artist?: ArtistDto;
  number?: number;
  variant?: string;
  isFoil?: boolean;
  isLimited?: boolean;
  imageMd5: string;
  setInfo: SetInfoDto;
  params?: CardParamsDto;
}
