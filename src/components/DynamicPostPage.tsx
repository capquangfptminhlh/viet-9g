import React from 'react';
import type { VerifiedPackage } from '../data/verified-package';
import { getPackagePageModel } from '../data/package-page';
import { getPackageRoutes } from '../data/package-routes';
import { buildSmsSyntax, buildSmsUri, REGISTRATION_CHANNEL } from '../config/agent-code';

interface DynamicPostPageProps {
  pkg: VerifiedPackage;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(value));
}

export default function DynamicPostPage({ pkg }: DynamicPostPageProps) {
  const page = getPackagePageModel(pkg);
  const affiliateSyntax = buildSmsSyntax(pkg.code);
  const affiliateSmsUri = buildSmsUri(pkg.code);
  const relatedPackages = getPackageRoutes()
    .filter((item) => item.id !== pkg.id && item.category === pkg.category)
    .slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 font-sans">
      <article className="space-y-7 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="space-y-3 border-b border-gray-100 pb-5">
          <p className="text-sm font-semibold text-red-700">Thông tin gói cước</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">{page.title}</h1>
          <p className="text-sm leading-6 text-gray-700">
            Thông số dưới đây được đối chiếu với nguồn Viettel. Khả năng đăng ký của từng thuê bao có thể thay đổi tại thời điểm thực hiện.
          </p>
          <p className="text-xs text-gray-500">Cập nhật: {formatDate(page.updatedAt)} · Giá trị đến: {formatDate(page.priceValidUntil)}</p>
        </header>

        <section aria-labelledby="thong-so-goi-cuoc" className="space-y-3">
          <h2 id="thong-so-goi-cuoc" className="text-xl font-extrabold text-gray-900">Thông số gói</h2>
          <dl className="overflow-hidden rounded-xl border border-gray-200">
            {page.facts.map((fact) => (
              <div className="grid grid-cols-1 border-b border-gray-100 last:border-0 sm:grid-cols-3" key={fact.label}>
                <dt className="bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">{fact.label}</dt>
                <dd className="px-4 py-3 text-sm text-gray-800 sm:col-span-2">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="uu-dai" className="space-y-3">
          <h2 id="uu-dai" className="text-xl font-extrabold text-gray-900">Ưu đãi được nêu trong nguồn</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700">
            {page.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
          </ul>
        </section>

        <section aria-labelledby="dieu-kien" className="space-y-3">
          <h2 id="dieu-kien" className="text-xl font-extrabold text-gray-900">Điều kiện cần lưu ý</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700">
            {page.eligibility.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        {page.registration ? (
          <section aria-labelledby="cu-phap-nguon" className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 id="cu-phap-nguon" className="text-xl font-extrabold text-gray-900">Cú pháp được nêu trong nguồn</h2>
            <p className="font-mono text-lg font-bold text-gray-800">{page.registration.syntax} gửi {page.registration.smsNumber}</p>
          </section>
        ) : null}

        <section aria-labelledby="dang-ky-qua-website" className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 id="dang-ky-qua-website" className="text-xl font-extrabold text-red-950">Đăng ký qua mã đại lý của website</h2>
          <p className="font-mono text-lg font-bold text-red-700">{affiliateSyntax} gửi {REGISTRATION_CHANNEL.smsNumber}</p>
          <a
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-center text-base font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
            href={affiliateSmsUri}
          >
            Đăng ký {pkg.code}
          </a>
          <p className="text-xs leading-5 text-red-900">
            Nút này chỉ soạn sẵn SMS theo mã đại lý {REGISTRATION_CHANNEL.agentCode} của TraCuuGoiCuoc.com. Viettel quyết định thuê bao có đủ điều kiện và kích hoạt gói hay không tại thời điểm gửi.
          </p>
        </section>

        {relatedPackages.length > 0 ? (
          <section aria-labelledby="goi-lien-quan" className="space-y-3 border-t border-gray-100 pt-5">
            <h2 id="goi-lien-quan" className="text-xl font-extrabold text-gray-900">Gói Viettel cùng nhóm để so sánh</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {relatedPackages.map((item) => (
                <a
                  key={item.id}
                  href={`/goi-cuoc/${item.id.toLowerCase()}`}
                  className="rounded-xl border border-gray-200 p-4 text-sm font-bold text-gray-900 transition-colors hover:border-red-300 hover:text-red-700"
                >
                  {item.code}
                  <span className="mt-1 block text-xs font-medium text-gray-500">
                    {item.priceVnd.toLocaleString('vi-VN')}đ · {item.dataAllowance ?? item.dataPerDay}
                  </span>
                </a>
              ))}
            </div>
            <a className="inline-flex text-sm font-bold text-red-700 underline" href="/goi-cuoc">Xem toàn bộ gói cước Viettel</a>
          </section>
        ) : null}

        <section className="border-t border-gray-100 pt-5 text-sm leading-6 text-gray-700">
          <h2 className="text-xl font-extrabold text-gray-900">Nguồn tham khảo</h2>
          <p className="mt-2"><a className="font-semibold text-blue-700 underline" href={page.sourceUrl} rel="nofollow noopener noreferrer">Xem thông tin trên trang Viettel</a></p>
        </section>
      </article>
    </main>
  );
}
