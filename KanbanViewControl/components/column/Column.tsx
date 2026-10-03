import * as React from "react";
import { useContext, useCallback, useRef, useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import Card from "../card/Card";
import ColumnHeader from "./ColumnHeader";
import { ColumnItem } from "../../interfaces";
import { isNullOrEmpty } from "../../lib/utils";
import NoResults from "../container/no-results";
import { getItemStyle, getListStyle } from "../../lib/card-drag";
import { BoardContext } from "../../context/board-context";
import {
  INITIAL_CARDS_VISIBLE,
  LOAD_MORE_CARDS_COUNT,
  SCROLL_LOAD_THRESHOLD_PX,
} from "../../lib/constants";
import { getColumnColorStyle } from "../../lib/column-colors";

function parseInitialCardsVisible(raw: unknown): number {
  if (raw == null || String(raw).trim() === "") return INITIAL_CARDS_VISIBLE;
  const n = parseInt(String(raw).trim(), 10);
  if (Number.isNaN(n) || n < 1 || n > 500) return INITIAL_CARDS_VISIBLE;
  return n;
}

const Column = ({ column, widthPx, color }: { column: ColumnItem; widthPx?: number; color?: string }) => {
  const { context, isMovePending, inlineEditKey } = useContext(BoardContext);
  const allowCardMove = ((context.parameters as unknown) as { allowCardMove?: { raw?: boolean } }).allowCardMove?.raw !== false;
  const hasCards = !isNullOrEmpty(column.cards) && column.cards!.length > 0;
  const columnStyle = { ...(widthPx != null ? { width: widthPx, minWidth: widthPx, maxWidth: widthPx } : {}), ...getColumnColorStyle(color) } as React.CSSProperties;
  const columnClass = `column-container${color ? " column-container--colored" : ""}`;
  const cards = column.cards ?? [];
  const totalCount = cards.length;

  const initialCardsVisible = parseInitialCardsVisible(
    (context.parameters as { initialCardsVisible?: { raw?: unknown } }).initialCardsVisible?.raw
  );
  const [visibleCount, setVisibleCount] = useState(initialCardsVisible);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const useProgressiveLoad = totalCount > initialCardsVisible;
  const cardsToShow = useProgressiveLoad ? cards.slice(0, visibleCount) : cards;
  const hasMore = useProgressiveLoad && visibleCount < totalCount;

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || !hasMore) return;
    const { scrollTop, clientHeight, scrollHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - SCROLL_LOAD_THRESHOLD_PX) {
      setVisibleCount((prev) => Math.min(prev + LOAD_MORE_CARDS_COUNT, totalCount));
    }
  }, [hasMore, totalCount]);

  const setScrollRef = useCallback(
    (el: HTMLDivElement | null) => {
      scrollContainerRef.current = el;
    },
    []
  );

  if (!allowCardMove) {
    return (
      <div className={columnClass} style={columnStyle}>
        <ColumnHeader column={column} />
        <div
          ref={setScrollRef}
          className="cards-wrapper"
          onScroll={useProgressiveLoad ? handleScroll : undefined}
        >
          {hasCards &&
            cardsToShow.map((item) => (
              <div key={item.id}>
                <Card item={item} draggable={false} />
              </div>
            ))}
          {!hasCards && <NoResults />}
        </div>
      </div>
    );
  }

  return (
    <div className={columnClass} style={columnStyle}>
      <ColumnHeader column={column} />
      <Droppable key={column.id.toString()} droppableId={column.id.toString()}>
        {(provided, snapshot) => (
          <div
            ref={(el) => {
              (provided.innerRef as (el: HTMLDivElement | null) => void)(el);
              scrollContainerRef.current = el;
            }}
            className="cards-wrapper"
            style={getListStyle(snapshot.isDraggingOver)}
            onScroll={useProgressiveLoad ? handleScroll : undefined}
            {...provided.droppableProps}
          >
            {hasCards &&
              cardsToShow.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id.toString()}
                  index={index}
                  isDragDisabled={isMovePending || !!inlineEditKey}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={getItemStyle(snapshot, provided.draggableProps.style)}
                    >
                      <Card item={item} dragHandleProps={provided.dragHandleProps} />
                    </div>
                  )}
                </Draggable>
              ))}
            {!hasCards && <NoResults />}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
