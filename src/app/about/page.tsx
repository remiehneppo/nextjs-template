import DashboardLayout from "@/components/layout/DashboardLayout";
import Header from "@/components/layout/Header";

export default function AboutPage() {
  return (
    <DashboardLayout>
      <Header title="Giới thiệu" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Giới thiệu</h2>
          <p className="text-gray-600">Trang giới thiệu template đang sẵn sàng để mở rộng.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
