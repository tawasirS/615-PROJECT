import Button from "./Button";
import ValidatedForm from "./ValidatedForm";

export default function ComponentsDocs() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Component docs (examples)</h2>
      <section>
        <h3 className="font-medium">Button</h3>
        <div className="flex gap-2 mt-2">
          <Button variant="primary">Primary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <section>
        <h3 className="font-medium">ValidatedForm</h3>
        <p className="text-sm text-zinc-600">Use data-required="true" on inputs to enforce presence.</p>
        <ValidatedForm onSubmit={async (d) => alert(JSON.stringify(d))}>
          <input name="demo" data-required="true" placeholder="Demo" className="w-full border px-3 py-2 rounded mt-2" />
          <div className="mt-2"><button className="btn-primary" type="submit">Submit</button></div>
        </ValidatedForm>
      </section>
    </div>
  );
}
