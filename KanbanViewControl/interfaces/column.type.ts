import { CardItem } from "./card.type";
import { UniqueIdentifier } from "./unique-identifier.type";

export interface ColumnItem {
  id: UniqueIdentifier,
  key?: UniqueIdentifier,
  title: string,
  cards?: CardItem[]
}
