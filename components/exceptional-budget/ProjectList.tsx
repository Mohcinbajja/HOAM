import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

interface ProjectListProps {
    selectedYear: number;
    onProjectSelect: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ selectedYear, onProjectSelect }) => {
    const { t } = useLanguage();
    const { selectedProperty, exceptionalProjects } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const projectsForYear = useMemo(() => {
        if (!selectedProperty) return [];
        return exceptionalProjects.filter(p => p.propertyId === selectedProperty.id && p.year === selectedYear);
    }, [exceptionalProjects, selectedProperty, selectedYear]);

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button onClick={() => setIsModalOpen(true)}>
                    <Icon name="plus" className="h-5 w-5 mr-2" />
                    {t('create_exceptional_budget')}
                </Button>
            </div>

            {projectsForYear.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projectsForYear.map(project => (
                        <ProjectCard key={project.id} project={project} onSelect={() => onProjectSelect(project.id)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <Icon name="alert_triangle" className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300">{t('no_projects_title')}</h4>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{t('no_projects_desc')}</p>
                </div>
            )}
            <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedYear={selectedYear} />
        </>
    );
};

export default ProjectList;
