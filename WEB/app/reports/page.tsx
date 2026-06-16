import DataTable from "@/app/components/DataTable";
import SharedShell from "@/app/SharedShell";
import PageHeader from "@/app/components/PageHeader";
import Container from "@/app/components/Container";
import ValidatedForm from "@/app/components/ValidatedForm";
import Tabs from "../components/tabs";

export default function DashboardPage() {
    return (
        <SharedShell>
            <Tabs element = {[
                {reportname: 'รายงานผู้เช่าค้างชำระ', href: '/reports/arrears'},
                {reportname: 'รายงานการชำระเงิน', href: '/reports/payment'},
                {reportname: 'รายงานค่าใช้จ่าย', href: '/reports/cost'},
                {reportname: 'รายงานสัญญาเช่า', href: '/reports/contract'},
            ]} />
            <div >
                
            </div>
        </SharedShell >
    );
}
