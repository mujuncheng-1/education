import { CopyOutlined } from "@ant-design/icons";
import { DndContext, type DragEndEvent, closestCenter } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button, Card, Col, Row, Space, Tag, message } from "antd";
import ReactECharts from "echarts-for-react";
import html2canvas from "html2canvas";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RecipeItem } from "../../api/modules/common";
import { getRecipeWeeklyApi } from "../../api/modules/common";
import { PageHeader } from "../../components/PageHeader";

interface SortableRecipeItemProps {
  item: RecipeItem;
}

function SortableRecipeItem({ item }: SortableRecipeItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`recipe-drag-item ${isDragging ? "dragging" : ""}`}
    >
      <div className="recipe-day">{item.day}</div>
      <div className="recipe-meals">
        <div>
          <strong>早：</strong>
          {item.breakfast.map((food) => (
            <Tag key={food}>{food}</Tag>
          ))}
        </div>
        <div>
          <strong>中：</strong>
          {item.lunch.map((food) => (
            <Tag key={food}>{food}</Tag>
          ))}
        </div>
        <div>
          <strong>晚：</strong>
          {item.dinner.map((food) => (
            <Tag key={food}>{food}</Tag>
          ))}
        </div>
      </div>
      <div className="recipe-cal">{item.calories} kcal</div>
    </div>
  );
}

export default function RecipePage() {
  const [list, setList] = useState<RecipeItem[]>([]);
  const recipeBoardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getRecipeWeeklyApi();
        setList(res.list);
      } catch (error) {
        console.error("[RecipePage] 加载食谱失败", error);
      }
    };

    void load();
  }, []);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setList((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex < 0 || newIndex < 0) {
        return items;
      }

      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const copyLastWeekRecipe = () => {
    if (!list.length) {
      message.warning("当前没有可复制的食谱数据");
      return;
    }

    const now = Date.now();
    const copied = list.map((item, index) => ({
      ...item,
      id: `${item.id}-copy-${now}-${index}`,
      day: `${item.day}（新周）`,
    }));
    setList(copied);
    message.success("已复制上周食谱，可继续调整菜品顺序");
  };

  const exportRecipeAsImage = async () => {
    if (!recipeBoardRef.current) {
      message.warning("未找到可导出的食谱区域");
      return;
    }

    try {
      const canvas = await html2canvas(recipeBoardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `食谱安排_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = url;
      link.click();
      message.success("食谱图片导出成功");
    } catch (error) {
      console.error("[RecipePage] 导出食谱图片失败", error);
      message.error("导出失败，请稍后重试");
    }
  };

  const nutritionOption = useMemo(() => {
    return {
      tooltip: { trigger: "item" },
      legend: { bottom: 0 },
      series: [
        {
          type: "pie",
          radius: ["42%", "68%"],
          data: [
            { name: "蛋白质", value: 28 },
            { name: "脂肪", value: 22 },
            { name: "碳水化合物", value: 35 },
            { name: "维生素", value: 15 },
          ],
        },
      ],
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="食谱与营养管理"
        description="按周安排食谱，支持拖拽排序、营养分析、复制上周食谱"
        extra={
          <Space>
            <Button icon={<CopyOutlined />} onClick={copyLastWeekRecipe}>
              复制上周食谱
            </Button>
            <Button type="primary" onClick={exportRecipeAsImage}>
              导出食谱图片
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title="本周食谱拖拽调整">
            <div ref={recipeBoardRef}>
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={list.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {list.map((item) => (
                    <SortableRecipeItem key={item.id} item={item} />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card title="营养占比分析">
            <ReactECharts option={nutritionOption} style={{ height: 300 }} />
            <Space wrap>
              <Tag color="red">过敏提醒：小麦</Tag>
              <Tag color="green">素食儿童：2人</Tag>
              <Tag color="gold">乳糖不耐：1人</Tag>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
