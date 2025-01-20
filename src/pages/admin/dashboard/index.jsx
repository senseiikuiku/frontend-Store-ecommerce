import React from "react";
import { Card, Col, Row, Statistic, DatePicker, Button } from "antd";
export default function DashboardAdmin() {
   const { RangePicker } = DatePicker;
   return (
      <>
         <div className="statistics-page">
            <header style={{ marginBottom: 20 }}>
               <h1>Thống Kê </h1>
            </header>
            <RangePicker style={{ marginBottom: 20 }} format="YYYY-MM-DD" />
            <Button type="primary" style={{ marginBottom: 20 }}>
               Tìm kiếm
            </Button>
            <Row gutter={16}>
               <Col span={8}>
                  <Card>
                     <Statistic title="Số lượng sản phẩm bán ra" value={200} />
                  </Card>
               </Col>
               <Col span={8}>
                  <Card>
                     <Statistic title="Doanh thu" value={10000} prefix="$" />
                  </Card>
               </Col>
               <Col span={8}>
                  <Card>
                     <Statistic title="Khách hàng mới" value={50} />
                  </Card>
               </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 20 }}>
               <Col span={8}>
                  <Card>
                     <Statistic title="Sản phẩm tồn kho" value={500} />
                  </Card>
               </Col>
               <Col span={8}>
                  <Card>
                     <Statistic
                        title="Đánh giá trung bình"
                        value={4.5}
                        suffix="/ 5"
                     />
                  </Card>
               </Col>
               <Col span={8}>
                  <Card>
                     <Statistic title="Số đơn hàng hoàn trả" value={5} />
                  </Card>
               </Col>
            </Row>
         </div>
      </>
   );
}
