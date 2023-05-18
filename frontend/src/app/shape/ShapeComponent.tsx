import { get as _get } from "lodash";

function Value({ value }: { value: any }) {
  if (typeof value !== "string") {
    console.error("Value value is not a string", value);
    return <></>;
  }
  return <div>{value}</div>;
}

function Formula({ value }: { value: any }) {
  if (typeof value !== "string") {
    console.error("Formula value is not a string", value);
    return <></>;
  }
  return (
    <div>
      Formula: <span className="font-bold">{value}</span>
    </div>
  );
}

export default function ShapeComponent({
  shape,
  value,
}: {
  shape: string;
  value: any;
}) {
  return shape === "value" ? (
    <Value value={value} />
  ) : shape === "formula" ? (
    <Formula value={value} />
  ) : (
    <>{String(value)}</>
  );
}
