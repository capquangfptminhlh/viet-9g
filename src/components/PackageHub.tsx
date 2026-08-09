import type { PackageHub as PackageHubDefinition } from '../data/package-hubs';
import type { VerifiedPackage } from '../data/verified-package';

interface Props {
  hub: PackageHubDefinition;
  packages: readonly VerifiedPackage[];
}

const vnd = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const date = new Intl.DateTimeFormat('vi-VN');

export default function PackageHub({ hub, packages }: Props) {
  if (packages.length === 0) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-black text-slate-900">{hub.title}</h1>
        <p className="mt-3 text-slate-600">Hiện chưa có gói nào đủ thông tin đã xác minh trong nhóm này.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-black text-slate-900">{hub.title}</h1>
      <p className="mt-3 max-w-3xl text-slate-600">{hub.description}</p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <caption className="sr-only">Bảng so sánh {hub.title}</caption>
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-5 py-4 font-bold">Gói cước</th>
              <th className="px-5 py-4 font-bold">Giá</th>
              <th className="px-5 py-4 font-bold">Chu kỳ</th>
              <th className="px-5 py-4 font-bold">Dung lượng</th>
              <th className="px-5 py-4 font-bold">Hiệu lực thông tin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <th scope="row" className="px-5 py-4 font-bold text-red-700">
                  <a className="hover:underline" href={`/goi-cuoc/${pkg.id.toLowerCase()}`}>{pkg.name}</a>
                </th>
                <td className="px-5 py-4 text-slate-700">{vnd.format(pkg.priceVnd)}</td>
                <td className="px-5 py-4 text-slate-700">{pkg.durationDays} ngày</td>
                <td className="px-5 py-4 text-slate-700">{pkg.dataAllowance ?? pkg.dataPerDay}</td>
                <td className="px-5 py-4 text-slate-700">{date.format(new Date(pkg.priceValidUntil))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-slate-500">Mỗi gói chỉ hiển thị các trường có trong dữ liệu đã xác minh.</p>
    </section>
  );
}
