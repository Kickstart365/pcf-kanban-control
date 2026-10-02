import * as React from "react";
import { Text } from "@fluentui/react/lib/Text";
import IconButton from "../button/IconButton";
import { ColumnItem } from "../../interfaces";
import { useContext, useMemo } from "react";
import { BoardContext } from "../../context/board-context";
import { useNavigation } from "../../hooks/useNavigation";
import { getColumnTotals } from "../../lib/opportunity-display";
import { getStrings } from "../../lib/strings";

interface IProps {
  column: ColumnItem
}

const ColumnHeader = ({ column }: IProps) => {
  const { context, activeView, locale } = useContext(BoardContext);
  const strings = getStrings(locale);
  const { createNewRecord } = useNavigation(context);

  const allowCreateNew = (context.parameters as { allowCreateNew?: { raw?: boolean } }).allowCreateNew?.raw !== false;

  const onAddNewRecord = async (column: string) => {
    await createNewRecord(activeView?.key as string, column);
    context.parameters.dataset.refresh();
  };

  const count = useMemo(() => {
    return column.cards?.length ?? 0;
  }, [column.cards]);

  const params = context.parameters as unknown as Record<string, { raw?: string }>;
  const totalFields = [params.columnTotalField?.raw ?? "estimatedvalue", params.columnSecondaryTotalField?.raw ?? ""]
    .map(field => field.trim()).filter((field, index, fields) => field && fields.indexOf(field) === index);
  const totals = totalFields.flatMap(field => {
    const metadata = context.parameters.dataset.columns.find(col => col.name === field);
    if (!metadata) return [];
    const isTransactionMoney = String(metadata.dataType).toLowerCase().startsWith("currency") && !field.endsWith("_base");
    const hasCurrency = context.parameters.dataset.columns.some(col => col.name === "transactioncurrencyid");
    if (isTransactionMoney && count > 0 && !hasCurrency) {
      return [{ field, label: metadata.displayName, text: strings.totalNeedsCurrencyLabel }];
    }
    const values = getColumnTotals(column.cards ?? [], field, isTransactionMoney);
    if (!values.length) values.push({ amount: 0, currency: "", currencyId: "" });
    return values.map(total => ({
      field: `${field}-${total.currencyId}`,
      label: metadata.displayName,
      text: isTransactionMoney && count > 0 && !total.currencyId ? strings.totalNeedsCurrencyLabel
        : `${context.formatting.formatDecimal(total.amount, 2)}${total.currency ? ` ${total.currency}` : ""}`,
    }));
  });

  return (
    <div className="column-header-container">
      <div className="column-header">
        <Text variant="large" className="column-stage-title" title={column.title}>{column.id === "unallocated" ? strings.toastUnallocated : column.title}</Text>
        <div className="column-actions">
          <Text variant="small" className="column-counter" title={strings.recordCountLabel(count)} aria-label={strings.recordCountLabel(count)}>{count}</Text>
          { allowCreateNew && (
            <IconButton iconName='Add' onClick={() => { onAddNewRecord(column.id as string); }} noBorder />
          ) }
        </div>
      </div>
      <div className="column-totals" aria-label={strings.columnTotalsLabel}>
        {totals.map(total => <div className="column-total" key={total.field}>
          <Text variant="small" className="column-total-label">{total.label}</Text>
          <Text variant="medium" className="column-total-value">{total.text}</Text>
        </div>)}
      </div>
    </div>
  );
}

export default ColumnHeader;
