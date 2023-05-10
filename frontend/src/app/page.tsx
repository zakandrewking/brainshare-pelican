import FileUpload from "./FileUpload";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div className="prose">
        <h2>Home</h2>
      </div>
      <FileUpload />
    </div>
  );
}
