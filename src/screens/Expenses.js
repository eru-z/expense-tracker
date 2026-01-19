import formatCurrency from "../utils/formatCurrency";
import useSettings from "../hooks/useSettings";

const { settings } = useSettings();

<Text>
  {formatCurrency(item.amount, settings.currency)}
</Text>
