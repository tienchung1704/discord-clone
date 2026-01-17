# Giới thiệu Chi tiết Công nghệ Dự án (Discord Clone)

Tài liệu này cung cấp cái nhìn tổng quan chi tiết về các công nghệ, thư viện và kiến trúc được sử dụng trong dự án Discord Clone.

## 1. Frontend (Giao diện & Trải nghiệm người dùng)

Dự án sử dụng **Next.js** làm framework chính, tận dụng sức mạnh của Server Components và App Router mới nhất.

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router) - Framework React mạnh mẽ cho sản xuất.
*   **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/) - Đảm bảo an toàn kiểu dữ liệu (Type safety).
*   **Styling (Giao diện)**:
    *   [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework.
    *   `clsx` & `tailwind-merge` - Quản lý và gộp các class CSS động một cách hiệu quả.
    *   [Lucide React](https://lucide.dev/) - Bộ icon đẹp và nhẹ.
*   **UI Components**:
    *   [Radix UI](https://www.radix-ui.com/) - Các thành phần UI nguyên bản (headless UI) dễ truy cập và tùy biến (Dialog, Popover, Tooltip, etc.).
    *   [Emoji Mart](https://github.com/missive/emoji-mart) - Bộ chọn Emoji đa nền tảng.
*   **Quản lý trạng thái (State Management)**:
    *   [Zustand](https://github.com/pmndrs/zustand) - Quản lý state global nhẹ và đơn giản.
    *   [TanStack Query (React Query)](https://tanstack.com/query/latest) - Quản lý dữ liệu từ server (server state) và caching.
*   **Forms & Validation**:
    *   [React Hook Form](https://react-hook-form.com/) - Xử lý form hiệu năng cao.
    *   [Zod](https://zod.dev/) - Thư viện định nghĩa và kiểm tra (validation) schema.
*   **Real-time (Thời gian thực)**:
    *   [Socket.io Client](https://socket.io/) - Kết nối WebSocket cho tính năng chat thời gian thực.
    *   [LiveKit Client](https://livekit.io/) - Xử lý Video Call và Voice Chat chất lượng cao.

## 2. Backend (Xử lý Server & API)

Backend được tích hợp trực tiếp trong Next.js thông qua API Routes, hoạt động như một serverless backend.

*   **Runtime**: Node.js (thông qua Next.js).
*   **Database ORM**: [Prisma](https://www.prisma.io/) - ORM hiện đại giúp làm việc với cơ sở dữ liệu dễ dàng và an toàn kiểu.
*   **Real-time Server**:
    *   `socket.io` được tích hợp custom server để xử lý các sự kiện websocket.
    *   `livekit-server-sdk` để quản lý các phòng (rooms) và token cho video/voice chat.

## 3. Cơ sở dữ liệu (Database)

*   **Hệ quản trị CSDL**: **MySQL**.
*   **Mô hình dữ liệu**: Được định nghĩa trong `schema.prisma` với các bảng chính:
    *   `Profile`: Thông tin người dùng.
    *   `Server`, `Channel`: Cấu trúc cộng đồng.
    *   `Member`: Thành viên trong server và vai trò.
    *   `Message`, `DirectMessage`: Tin nhắn.
    *   `Hobby`: Sở thích người dùng.
*   **Quan hệ**: Sử dụng các quan hệ chặt chẽ (One-to-many, Many-to-many) để liên kết dữ liệu.

## 4. Các dịch vụ bên thứ 3 (Cloud Services)

Dự án tích hợp các dịch vụ SaaS hàng đầu để xử lý các tác vụ phức tạp:

*   **Xác thực (Authentication)**: [Clerk](https://clerk.com/) - Quản lý đăng nhập, đăng ký, và session người dùng một cách bảo mật.
*   **Lưu trữ tập tin (File Storage)**: [UploadThing](https://uploadthing.com/) - Giải pháp upload file dễ dàng cho Next.js (lưu trữ ảnh avatar, ảnh server, file tin nhắn).
*   **Thanh toán (Payment)**: [Stripe](https://stripe.com/) - Xử lý thanh toán cho và đăng ký gói Premium.
*   **Video/Audio**: [LiveKit](https://livekit.io/) - Cơ sở hạ tầng cho tính năng gọi điện và livestream.

## 5. Quốc tế hóa (Internationalization)

*   **Thư viện**: `next-intl` - Hỗ trợ đa ngôn ngữ (Tiếng Anh, Tiếng Việt, v.v.) cho toàn bộ ứng dụng.

## 6. Testing & Quality Assurance

*   **Test Runner**: [Vitest](https://vitest.dev/) - Framework test nhanh cho Vite/Next.js.
*   **Testing Library**: `react-testing-library` để test các component React.
*   **Linting**: ESLint để kiểm tra chất lượng code.

---
*Tài liệu này được tạo tự động dựa trên cấu hình dự án hiện tại.*
