import DataTable from "../../components/DataTable";
import SharedShell from "../../SharedShell";
import PageHeader from "../../components/PageHeader";
import Container from "../../components/Container";
import ValidatedForm from "@/app/components/ValidatedForm";

export default function DashboardPage() {
    return (
        <SharedShell>
            <div className="grid grid-cols-2 gap-2">
                <div className="">
                    <div className="bg-white shadow rounded-lg p-6">
                        {/* <PageHeader title="Dashboard" subtitle="Overview & examples" /> */}
                        <DataTable />
                    </div>
                </div>
                <div className="">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h6 className="font-medium mb-2">ชื่อ</h6>
                        <ValidatedForm>
                            <div className="grid grid-cols-2 gap-3">
                                <input name="first" data-required="true" placeholder="First name" className="w-full border px-3 py-2 rounded" />
                                <input name="last" data-required="true" placeholder="Last name" className="w-full border px-3 py-2 rounded" />
                                <input name="email" placeholder="Email" className="w-full border px-3 py-2 rounded" />
                            </div>
                            <div className="mt-2">
                                <button type="submit" className="btn-primary">Submit</button>
                            </div>
                        </ValidatedForm>
                    </div>
                </div>
            </div>
        </SharedShell>
    );
}
